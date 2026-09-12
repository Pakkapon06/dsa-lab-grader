#include <iostream>
#include <cmath>
#include <iomanip>
#include <cstdio>
using namespace std;

long double Speed(long double p) {
    return 5 + 10 * sqrtl(p);
}

long double Burn(long double p) {
    return 2 * p * p * p + p;
}

int main() {
    int t;
    scanf("%d", &t);
    while (t--) {
        long double F, D;
        scanf("%Lf %Lf", &F, &D);
        long double r = F / D;
        long double lo = 0, hi = 1;
        for (int i = 0; i < 100; i++) {
            long double m = (lo + hi) / 2;
            if (Burn(m) / Speed(m) <= r) lo = m;
            else hi = m;
        }
        printf("%.6Lf\n", D / Speed(lo));
    }
    return 0;
}
