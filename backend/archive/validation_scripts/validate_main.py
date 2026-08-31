#!/usr/bin/env python3
"""
Validation script for consolidated main.py
Checks syntax, imports, and structure without requiring full environment setup.
"""

import ast
import sys
from pathlib import Path

def validate_syntax(file_path):
    """Validate Python syntax"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        ast.parse(code)
        print("[PASS] Syntax validation passed")
        return True
    except SyntaxError as e:
        print(f"[FAIL] Syntax error: {e}")
        return False

def check_imports(file_path):
    """Check if imports are structurally correct"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        
        tree = ast.parse(code)
        imports = []
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                module = node.module if node.module else ''
                for alias in node.names:
                    imports.append(f"{module}.{alias.name}")
        
        print(f"[PASS] Found {len(imports)} imports")
        
        # Check for expected imports
        expected_imports = [
            'fastapi',
            'asyncio',
            'logging',
            'datetime',
            'dotenv',
            'uvicorn',
            'slowapi'
        ]
        
        for expected in expected_imports:
            if any(expected in imp for imp in imports):
                print(f"  [OK] {expected} imported")
            else:
                print(f"  [WARN] {expected} not found (may be optional)")
        
        return True
    except Exception as e:
        print(f"[FAIL] Import check failed: {e}")
        return False

def check_structure(file_path):
    """Check file structure and key components"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
        
        tree = ast.parse(code)
        
        # Check for key components
        components = {
            'FastAPI app': False,
            'lifespan function': False,
            'WebSocket endpoint': False,
            'API endpoints': False,
            'monitoring_loop': False,
            'process_packet': False
        }
        
        for node in ast.walk(tree):
            # Check for FastAPI app
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id == 'app':
                        if isinstance(node.value, ast.Call):
                            components['FastAPI app'] = True
            
            # Check for functions (both regular and async)
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if node.name == 'lifespan':
                    components['lifespan function'] = True
                elif node.name == 'monitoring_loop':
                    components['monitoring_loop'] = True
                elif node.name == 'process_packet':
                    components['process_packet'] = True
                elif node.name == 'websocket_endpoint':
                    components['WebSocket endpoint'] = True
                elif hasattr(node, 'decorator_list'):
                    for decorator in node.decorator_list:
                        # Check for @app.get, @app.post, etc.
                        if isinstance(decorator, ast.Call):
                            if isinstance(decorator.func, ast.Attribute):
                                if decorator.func.attr in ['get', 'post', 'put', 'delete']:
                                    components['API endpoints'] = True
                        # Check for @limiter.limit decorator
                        elif isinstance(decorator, ast.Call):
                            if isinstance(decorator.func, ast.Attribute):
                                if decorator.func.attr == 'limit':
                                    components['API endpoints'] = True
        
        print("[PASS] Structure validation:")
        for component, found in components.items():
            status = "[OK]" if found else "[MISSING]"
            print(f"  {status} {component}")
        
        return all(components.values())
    except Exception as e:
        print(f"[FAIL] Structure check failed: {e}")
        return False

def main():
    script_dir = Path(__file__).parent
    main_file = script_dir / "main.py"
    
    print("=" * 60)
    print("Validating consolidated main.py")
    print("=" * 60)
    
    results = []
    
    # Syntax validation
    results.append(validate_syntax(main_file))
    print()
    
    # Import check
    results.append(check_imports(main_file))
    print()
    
    # Structure check
    results.append(check_structure(main_file))
    print()
    
    if all(results):
        print("=" * 60)
        print("[SUCCESS] All validations passed!")
        print("=" * 60)
        return 0
    else:
        print("=" * 60)
        print("[FAILURE] Some validations failed")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
