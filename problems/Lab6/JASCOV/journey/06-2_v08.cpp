#include <iostream>
#include <cmath>
#include <iomanip>
#include <cstdio>
using namespace std;

double Speed(double p) {
    return 5 + 10 * sqrt(p);
}

double Burn(double p) {
    return 2 * p * p * p + p;
}

double Ratio(double p) {
    return Burn(p) / Speed(p);
}

int main() {
    int t;
    scanf("%d", &t);
    while (t--) {
        double F, D;
        scanf("%lf %lf", &F, &D);
        double r = F / D;
        double best = 0;
        double step = 0.5;
        double p = 0;
        for (int i = 0; i < 100; i++) {
            if (p + step <= 1 && Ratio(p + step) <= r) p += step;
            step /= 2;
        }
        best = p;
        printf("%.6f\n", D / Speed(best));
    }
    return 0;
}
