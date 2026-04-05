import base64
print('hello')
# Dangerous eval
def go():
    eval('2+2')
# Encoded payload
exec(base64.b64decode('cHJpbnQoJ2hpJyk=').decode())
