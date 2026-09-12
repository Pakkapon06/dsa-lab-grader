a = int(input())
b = int(input())
c = int(input())

if (a <= 0 or b <= 0 or c <= 0):
    print("false")

max = c
if a > max:
    c = a
    a = max
max = c
if b > max:
    c = b
    b = max

if (c**2 == a**2 + b**2):
    print("ture")
else:
    print("false")