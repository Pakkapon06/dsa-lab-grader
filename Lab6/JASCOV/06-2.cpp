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
    ios::sync_with_stdio(false);
    cin.tie(0);

    int t;
    cin >> t;
    cout << fixed << setprecision(6);
    while (t--) {
        double F, D;
        cin >> F >> D;

        double r = F / D;
        double p;
        if (Burn(1.0) / Speed(1.0) <= r) {
            p = 1.0;
        } else {
            double lo = 0, hi = 1;
            for (int i = 0; i < 100; i++) {
                double mid = (lo + hi) / 2;
                if (Burn(mid) / Speed(mid) <= r) lo = mid;
                else hi = mid;
            }
            p = lo;
        }

        cout << D / Speed(p) << "\n";
    }
    return 0;
}
