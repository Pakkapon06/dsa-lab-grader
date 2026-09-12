#include <iostream>
#include <cmath>
using namespace std;

long long j(int x) {
    return x * (long long)10000000 - 7;
}


int main() {
    int t, p;
    int T[300010];
    cin >> t >> p;

    long long fibo[40];
    fibo[0] = 1;
    fibo[1] = 2;

    int index = 2;
    while (true) {
        fibo[index] = fibo[index - 1] + fibo[index - 2];
        if ( fibo[index] > 1000000 ) break;
        index++;
    }

    while (t--) {
        long long J = 1;
        int ai;
        cin >> ai;

        for (int i = index - 1; fibo[i] >= 1; i--) {
            if (fibo[i] <= ai) {
                ai -= fibo[i];
                J = (J * (j(fibo[i]) % p)) % p;
            }
        }

        cout << J << endl;
    }    

    return 0;
}