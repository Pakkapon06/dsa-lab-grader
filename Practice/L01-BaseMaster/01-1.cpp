#include <iostream>
#include <string>
using namespace std;

int DigitVal(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    return c - 'A' + 10;
}

char ValDigit(int v) {
    if (v < 10) return (char)('0' + v);
    return (char)('A' + v - 10);
}

unsigned long long ToValue(string s, int b) {
    unsigned long long v = 0;
    for (int i = 0; i < (int)s.size(); i++) v = v * b + DigitVal(s[i]);
    return v;
}

string ToBase(unsigned long long v, int b) {
    if (v == 0) return "0";
    string r = "";
    while (v > 0) { r += ValDigit((int)(v % b)); v /= b; }
    string out = "";
    for (int i = (int)r.size() - 1; i >= 0; i--) out += r[i];
    return out;
}

int main() {
    int q;
    if (!(cin >> q)) return 0;
    while (q--) {
        int b1, b2;
        string x;
        cin >> b1 >> b2 >> x;
        cout << ToBase(ToValue(x, b1), b2) << "\n";
    }
    return 0;
}
