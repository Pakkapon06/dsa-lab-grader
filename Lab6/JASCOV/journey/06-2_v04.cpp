#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

double Speed(double p) {
    return 5 + 10 * sqrt(p);
}

double Burn(double p) {
    return 2 * p * p * p + p;
}

int main() {
    int t;
    cin >> t;
    while (t--) {
        double F, D;
        cin >> F >> D;
        double r = F / D;
        double lo = 0, hi = 1;
        for (int i = 0; i < 100; i++) {
            double m = (lo + hi) / 2;
            if (Burn(m) / Speed(m) <= r) lo = m;
            else hi = m;
        }
        cout << D / Speed(lo) << "\n";
    }
    return 0;
}
