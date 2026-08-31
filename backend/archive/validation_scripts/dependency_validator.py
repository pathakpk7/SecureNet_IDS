#!/usr/bin/env python3
"""
Dependency Validation for consolidated main.py
Phase 3: Import Validation
"""

import sys
import importlib
from pathlib import Path

class DependencyValidator:
    def __init__(self):
        self.required_modules = [
            'asyncio',
            'logging', 
            'datetime',
            'typing',
            'contextlib',
            'json',
            'time',
            'os',
            'dotenv',
            'fastapi',
            'uvicorn',
            'slowapi'
        ]
        
        self.required_classes = {
            'fastapi': ['FastAPI', 'HTTPException', 'WebSocket', 'WebSocketDisconnect', 'Depends', 'BackgroundTasks'],
            'fastapi.middleware.cors': ['CORSMiddleware'],
            'fastapi.responses': ['JSONResponse'],
            'slowapi': ['Limiter', '_rate_limit_exceeded_handler'],
            'slowapi.util': ['get_remote_address'],
            'slowapi.errors': ['RateLimitExceeded'],
            'contextlib': ['asynccontextmanager']
        }
        
        self.local_modules = [
            '.config',
            '.database', 
            '.schemas',
            '.capture',
            '.feature_engineering',
            '.predictor',
            '.threat_intel',
            '.utils',
            '.csv_logger'
        ]
        
        self.validation_results = {}
    
    def validate_standard_library(self):
        """Validate standard library imports"""
        print("\n[CHECK] Standard Library Imports")
        
        standard_libs = ['asyncio', 'logging', 'datetime', 'typing', 'contextlib', 'json', 'time', 'os']
        
        for lib in standard_libs:
            try:
                importlib.import_module(lib)
                print(f"  [OK] {lib}")
                self.validation_results[lib] = True
            except ImportError as e:
                print(f"  [FAIL] {lib}: {e}")
                self.validation_results[lib] = False
        
        return all(self.validation_results.values())
    
    def validate_external_packages(self):
        """Validate external package imports"""
        print("\n[CHECK] External Package Imports")
        
        external_packages = ['dotenv', 'fastapi', 'uvicorn', 'slowapi']
        
        for pkg in external_packages:
            try:
                importlib.import_module(pkg)
                print(f"  [OK] {pkg}")
                self.validation_results[pkg] = True
            except ImportError as e:
                print(f"  [FAIL] {pkg}: {e}")
                self.validation_results[pkg] = False
        
        return all(self.validation_results.get(pkg, False) for pkg in external_packages)
    
    def validate_classes(self):
        """Validate specific class imports"""
        print("\n[CHECK] Class Import Validation")
        
        for module, classes in self.required_classes.items():
            try:
                mod = importlib.import_module(module)
                for cls in classes:
                    if hasattr(mod, cls):
                        print(f"  [OK] {module}.{cls}")
                        self.validation_results[f"{module}.{cls}"] = True
                    else:
                        print(f"  [FAIL] {module}.{cls} - Class not found")
                        self.validation_results[f"{module}.{cls}"] = False
            except ImportError as e:
                print(f"  [FAIL] {module}: {e}")
                for cls in classes:
                    self.validation_results[f"{module}.{cls}"] = False
        
        return all(v for k, v in self.validation_results.items() if '.' in k)
    
    def validate_local_modules(self):
        """Validate local module availability"""
        print("\n[CHECK] Local Module Availability")
        
        backend_dir = Path(__file__).parent
        
        local_files = {
            '.config': 'config.py',
            '.database': 'database.py',
            '.schemas': 'schemas.py', 
            '.capture': 'capture.py',
            '.feature_engineering': 'feature_engineering.py',
            '.predictor': 'predictor.py',
            '.threat_intel': 'threat_intel.py',
            '.utils': 'utils.py',
            '.csv_logger': 'csv_logger.py'  # Optional
        }
        
        for module, filename in local_files.items():
            file_path = backend_dir / filename
            if file_path.exists():
                status = "[OK]" if filename != 'csv_logger.py' else "[OPTIONAL]"
                print(f"  {status} {filename} exists")
                self.validation_results[module] = True
            else:
                status = "[FAIL]" if filename != 'csv_logger.py' else "[OPTIONAL]"
                print(f"  {status} {filename} not found")
                self.validation_results[module] = (filename == 'csv_logger.py')  # CSV logger is optional
        
        return all(self.validation_results.get(mod, True) for mod in local_files.keys())
    
    def validate_schema_imports(self):
        """Validate that schemas.py has required classes"""
        print("\n[CHECK] Schema Classes Availability")
        
        required_schemas = [
            'Alert', 'LogEntry', 'Stats', 'MonitoringStatus', 
            'APIResponse', 'WebSocketMessage', 'HealthCheck', 'BlacklistEntry'
        ]
        
        schemas_file = Path(__file__).parent / 'schemas.py'
        
        if not schemas_file.exists():
            print(f"  [FAIL] schemas.py not found")
            return False
        
        try:
            with open(schemas_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for schema in required_schemas:
                if f"class {schema}" in content or f"{schema} = " in content:
                    print(f"  [OK] {schema} found in schemas.py")
                    self.validation_results[f"schema.{schema}"] = True
                else:
                    print(f"  [WARN] {schema} not found in schemas.py")
                    self.validation_results[f"schema.{schema}"] = False
            
            return all(self.validation_results.get(f"schema.{s}", True) for s in required_schemas)
            
        except Exception as e:
            print(f"  [FAIL] Error reading schemas.py: {e}")
            return False
    
    def run_validation(self):
        """Run complete dependency validation"""
        print("=" * 80)
        print("PHASE 3: IMPORT VALIDATION")
        print("=" * 80)
        
        results = []
        
        # Run all validations
        results.append(self.validate_standard_library())
        results.append(self.validate_external_packages())
        results.append(self.validate_classes())
        results.append(self.validate_local_modules())
        results.append(self.validate_schema_imports())
        
        # Print summary
        print("\n" + "=" * 80)
        print("IMPORT VALIDATION SUMMARY")
        print("=" * 80)
        
        total = len(self.validation_results)
        passed = sum(1 for v in self.validation_results.values() if v)
        failed = total - passed
        
        print(f"Total checks: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        
        if failed == 0:
            print("\n[SUCCESS] All dependency checks passed")
            return True
        else:
            print(f"\n[FAILURE] {failed} dependency check(s) failed")
            return False

def main():
    validator = DependencyValidator()
    success = validator.run_validation()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
