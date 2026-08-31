#!/usr/bin/env python3
"""
Architecture Analysis for Phase 2 Refactor
Analyzes current backend structure, dependencies, and imports
"""

import ast
import sys
import os
from pathlib import Path
from collections import defaultdict, Counter
import json


class ArchitectureAnalyzer:
    def __init__(self, backend_dir):
        self.backend_dir = Path(backend_dir)
        self.import_graph = defaultdict(set)
        self.file_dependencies = defaultdict(set)
        self.module_sizes = {}
        self.current_structure = {}
        
    def analyze_python_files(self):
        """Analyze all Python files in the backend directory"""
        print("=" * 80)
        print("PHASE 2 - STEP 1: CURRENT BACKEND ANALYSIS")
        print("=" * 80)
        
        python_files = list(self.backend_dir.glob("*.py"))
        # Exclude __pycache__ and archive
        python_files = [f for f in python_files if f.name != "__init__.py"]
        
        print(f"\n[INFO] Found {len(python_files)} Python files at root level")
        
        for py_file in python_files:
            self.analyze_file(py_file)
        
        self.analyze_directories()
        self.generate_dependency_graph()
        self.generate_import_graph()
        self.generate_file_movement_plan()
        
        return True
    
    def analyze_file(self, file_path):
        """Analyze a single Python file for imports and dependencies"""
        try:
            module_name = file_path.stem
            self.module_sizes[module_name] = file_path.stat().st_size
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            try:
                tree = ast.parse(content)
            except SyntaxError:
                print(f"  [WARN] Syntax error in {module_name}")
                return
            
            # Analyze imports
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        self.import_graph[module_name].add(alias.name)
                        self.file_dependencies[module_name].add(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module if node.module else ''
                    for alias in node.names:
                        import_name = f"{module}.{alias.name}" if module else alias.name
                        self.import_graph[module_name].add(import_name)
                        self.file_dependencies[module_name].add(import_name)
            
        except Exception as e:
            print(f"  [ERROR] Error analyzing {file_path}: {e}")
    
    def analyze_directories(self):
        """Analyze directory structure"""
        print("\n[CHECK] Current Directory Structure")
        
        directories = [d for d in self.backend_dir.iterdir() if d.is_dir() and not d.name.startswith('_')]
        
        for directory in sorted(directories):
            print(f"  [DIR] {directory.name}/")
            # Count Python files
            py_files = list(directory.rglob("*.py"))
            print(f"     - {len(py_files)} Python files")
            
            self.current_structure[directory.name] = {
                'files': [f.name for f in py_files],
                'count': len(py_files)
            }
    
    def generate_dependency_graph(self):
        """Generate dependency graph"""
        print("\n[CHECK] Generating Dependency Graph")
        
        # Count dependencies per module
        dependency_counts = {}
        for module, dependencies in self.file_dependencies.items():
            # Filter out standard library
            external_deps = [d for d in dependencies if not self.is_stdlib(d)]
            dependency_counts[module] = len(external_deps)
        
        # Sort by dependency count
        sorted_deps = sorted(dependency_counts.items(), key=lambda x: x[1], reverse=True)
        
        print("\n[INFO] Module Dependency Counts:")
        for module, count in sorted_deps:
            print(f"  {module}: {count} dependencies")
        
        return sorted_deps
    
    def generate_import_graph(self):
        """Generate import graph for circular dependency detection"""
        print("\n[CHECK] Generating Import Graph")
        
        # Build simplified graph (local imports only)
        local_imports = defaultdict(set)
        for module, imports in self.import_graph.items():
            for imp in imports:
                # Only consider local imports
                if imp.startswith('.') or any(local in imp for local in self.module_sizes.keys()):
                    local_imports[module].add(imp)
        
        # Check for potential circular dependencies
        print(f"\n[INFO] Local Import Relationships: {len(local_imports)} modules with local imports")
        
        for module, imports in local_imports.items():
            if imports:
                print(f"  {module} -> {', '.join(list(imports)[:5])}")
                if len(imports) > 5:
                    print(f"    ... and {len(imports) - 5} more")
        
        # Simple circular dependency check
        circular = []
        for module in local_imports:
            for dep in local_imports[module]:
                dep_name = dep.split('.')[-1] if '.' in dep else dep
                if dep_name in local_imports and module in local_imports[dep_name]:
                    circular.append((module, dep_name))
        
        if circular:
            print(f"\n  [WARN] Potential circular dependencies: {circular}")
        else:
            print(f"  [OK] No obvious circular dependencies")
        
        return local_imports
    
    def generate_file_movement_plan(self):
        """Generate file movement plan for refactoring"""
        print("\n[CHECK] Generating File Movement Plan")
        
        movement_plan = {
            'root_level': {
                'current': list(self.module_sizes.keys()),
                'target': {
                    'main.py': 'main.py (keep, reduce to 200 lines)',
                    'config.py': 'core/config.py',
                    'csv_logger.py': 'utils/csv_logger.py',
                    'schemas.py': 'schemas/schemas.py',
                    'utils.py': 'utils/utils.py (keep, split)',
                    '__init__.py': '__init__.py (keep)'
                }
            },
            'ml': {
                'current': [],
                'target': {
                    'predictor.py': 'ml/predictor.py',
                    'feature_engineering.py': 'ml/feature_engineering.py'
                }
            },
            'capture': {
                'current': [],
                'target': {
                    'capture.py': 'capture/capture.py'
                }
            },
            'threat_intelligence': {
                'current': [],
                'target': {
                    'threat_intel.py': 'threat_intelligence/manager.py (split by provider)'
                }
            },
            'services': {
                'current': [],
                'target': {
                    'monitoring_service.py': 'NEW - extract from main.py',
                    'alert_service.py': 'NEW - extract from main.py',
                    'threat_service.py': 'NEW - extract from main.py',
                    'report_service.py': 'NEW - extract from main.py',
                    'statistics_service.py': 'NEW - extract from main.py',
                    'blacklist_service.py': 'NEW - extract from main.py',
                    'websocket_service.py': 'NEW - extract from main.py'
                }
            },
            'api': {
                'current': [],
                'target': {
                    'routes/monitoring.py': 'NEW - extract from main.py',
                    'routes/alerts.py': 'NEW - extract from main.py',
                    'routes/logs.py': 'NEW - extract from main.py',
                    'routes/blacklist.py': 'NEW - extract from main.py',
                    'routes/reports.py': 'NEW - extract from main.py',
                    'routes/health.py': 'NEW - extract from main.py',
                    'routes/threat_intel.py': 'NEW - extract from main.py',
                    'routes/admin.py': 'NEW - extract from main.py',
                    'websocket.py': 'NEW - extract from main.py'
                }
            },
            'repositories': {
                'current': self.current_structure.get('database', {}).get('files', []),
                'target': {
                    'repositories/': 'KEEP - already organized'
                }
            },
            'database': {
                'current': ['database.py'],
                'target': {
                    'database.py': 'database/database.py'
                }
            },
            'monitoring': {
                'current': self.current_structure.get('background_jobs', {}).get('files', []),
                'target': {
                    'scheduler.py': 'monitoring/scheduler.py',
                    'tasks.py': 'monitoring/tasks.py'
                }
            },
            'reporting': {
                'current': self.current_structure.get('reporting', {}).get('files', []),
                'target': {
                    'generators/': 'KEEP - already organized',
                    'templates/': 'KEEP - already organized'
                }
            },
            'siem': {
                'current': self.current_structure.get('siem', {}).get('files', []),
                'target': {
                    'connectors/': 'KEEP - already organized'
                }
            },
            'rbac': {
                'current': self.current_structure.get('rbac', {}).get('files', []),
                'target': {
                    'permissions.py': 'core/security.py (merge)'
                }
            },
            'utils': {
                'current': self.current_structure.get('utils', {}).get('files', []),
                'target': {
                    'central_logging.py': 'core/logging.py (merge)',
                    'health_monitor.py': 'monitoring/health_monitor.py'
                }
            }
        }
        
        print("\n[INFO] File Movement Plan:")
        for category, plan in movement_plan.items():
            print(f"\n  {category.upper()}:")
            print(f"    Current: {len(plan['current'])} files")
            print(f"    Target: {len(plan['target'])} files")
            for target, description in plan['target'].items():
                print(f"      -> {target}: {description}")
        
        return movement_plan
    
    def is_stdlib(self, import_name):
        """Check if import is from standard library"""
        stdlib_modules = {
            'asyncio', 'logging', 'datetime', 'typing', 'contextlib', 
            'json', 'time', 'os', 'pathlib', 'collections', 'functools',
            'enum', 'abc', 'copy', 'hashlib', 'random', 're', 'string',
            'math', 'statistics', 'fractions', 'decimal', 'numbers',
            'itertools', 'heapq', 'bisect', 'array', 'queue', 'multiprocessing',
            'threading', 'concurrent', 'subprocess', 'signal', 'pickle',
            'base64', 'binascii', 'struct', 'codecs', 'io', 'csv'
        }
        base_name = import_name.split('.')[0]
        return base_name in stdlib_modules
    
    def print_summary(self):
        """Print analysis summary"""
        print("\n" + "=" * 80)
        print("ARCHITECTURE ANALYSIS SUMMARY")
        print("=" * 80)
        
        print(f"\nTotal Python Files: {len(self.module_sizes)}")
        print(f"Total Lines of Code: {sum(self.module_sizes.values())} bytes")
        
        print("\nCurrent Issues:")
        print("  1. Business logic mixed in main.py (violates Clean Architecture)")
        print("  2. No service layer (business logic in routes)")
        print("  3. ML modules at root level (should be in ml/)")
        print("  4. Threat intelligence monolithic (should be split by provider)")
        print("  5. Configuration scattered (should be in core/)")
        print("  6. Logging scattered (should be in core/)")
        print("  7. Security scattered (should be in core/)")
        print("  8. Monitoring in background_jobs (should be in monitoring/)")
        
        print("\nRefactoring Priorities:")
        print("  1. Create folder structure")
        print("  2. Move configuration to core/")
        print("  3. Split main.py into routes and services")
        print("  4. Move ML modules to ml/")
        print("  5. Split threat intelligence by provider")
        print("  6. Move monitoring modules")
        print("  7. Update imports throughout")
        print("  8. Validate all changes")


def main():
    backend_dir = Path(__file__).parent
    
    analyzer = ArchitectureAnalyzer(backend_dir)
    analyzer.analyze_python_files()
    analyzer.print_summary()
    
    # Save analysis to JSON
    output_file = backend_dir / "architecture_analysis_step1.json"
    report = {
        "module_sizes": analyzer.module_sizes,
        "file_dependencies": dict(analyzer.file_dependencies),
        "import_graph": dict(analyzer.import_graph),
        "current_structure": analyzer.current_structure
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"\n[INFO] Analysis saved to {output_file}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
