#include <iostream>
#include <string>
#include <cmath>
using namespace std;

bool CheckPrime(int x) {
    if (x <= 1) return false;
    
    if (x <= 3) return true;

    if (x % 2 == 0 || x % 3 == 0) return false;
    
    for (int i = 5; i * i <= x; i += 6) {
        if (x % i == 0 || x % (i + 2) == 0) {
            return false;
        }
    }
    
    return true;
}

bool CheckCircularPrime(int x) {
    string sNum = to_string(x);
    
    int len = sNum.length();
    int temp = x;

    for(int i = 0;i < len;i++) {
        int lastdigit = temp % 10;
        temp /= 10;
        temp = lastdigit * (int)round(pow(10, len - 1)) + temp;

        if (!CheckPrime(temp)) return false;
    }

    return true;
}

int FindNearestPrime(int x) {
    while (!CheckPrime(x)) {
        x++;
    }
    return x;
}

int main() {
    int start, stop, cPrime[100000] = {0};
    int* ptr = cPrime;
    cin >> start;
    cin >> stop;

    for (; start <= stop; start++) {
        if (CheckCircularPrime(start)) {
            *ptr = start;
            ptr++;
        }
    }

    int count = ptr - cPrime;
    if (count == 0) {
        cout << "Falsum Thesaurum";
    }
    else {
        double sum = 0;
        for (int i = 0; i < count; i++) sum += cPrime[i];
        double avg = sum / count;
        if (avg == floor(avg)) {
            cout << avg;
        }
        else {
            cout << FindNearestPrime((int)(avg));
        }
    }

    return 0;
}