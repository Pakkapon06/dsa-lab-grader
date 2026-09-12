#include <iostream>
using namespace std;

typedef struct _frac {
    long long p, q;
} Frac;

Frac Cf(long long a, long long b) {
    long long quo = a / b;
    long long rem = a % b;
    if (rem == 0) return {quo, 1};

    Frac sub = Cf(b, rem);
    return {quo * sub.p + sub.q, sub.p};
}

int main() {
    long long a, b;
    cin >> a >> b;
    if (a < b) { long long t = a; a = b; b = t; }

    Frac ans = Cf(a, b);
    cout << ans.p << " " << ans.q << "\n";
    return 0;
}