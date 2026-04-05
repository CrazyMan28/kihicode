import os
import sys

# allow running tests directly from project dir
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from audit.run_audit import run_quick_audit


def test_quick_audit_detects_eval(tmp_path):
    p = tmp_path / "bad.py"
    p.write_text("print('hi')\neval('1+1')\n")
    res = run_quick_audit([str(p)])
    assert res['summary']['total_files'] == 1
    assert res['summary']['total_issues'] >= 1


if __name__ == '__main__':
    test_quick_audit_detects_eval(tmp_path=__import__('pathlib').Path('.').resolve())
    print('smoke test passed')
