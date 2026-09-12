#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

double Speed(double p) {
    return 5 + 10 * sqrt(p);
}

int main() {
    int t;
    cin >> t;
    cout << fixed << setprecision(6);
    while (t--) {
        double F, D;
        cin >> F >> D;
        cout << D / Speed(1.0) << "\n";
    }
    return 0;
}
