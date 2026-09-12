#include <iostream>
#include <string>
#include <cctype>
using namespace std;

typedef struct _value {
    bool isNum;
    string s;
    long long n;
} Value;

Value vst[205];
int vtop;
char ost[205];
int otop;
bool err;

int Prec(char c) {
    if (c == '*') return 2;
    return 1;
}

void Apply() {
    if (vtop < 2 || otop < 1) { err = true; return; }
    Value b = vst[--vtop];
    Value a = vst[--vtop];
    char op = ost[--otop];
    Value r;
    r.isNum = false;
    r.n = 0;
    if (op == '*') {
        if (a.isNum || !b.isNum) { err = true; return; }
        string t = "";
        for (long long i = 0; i < b.n; i++) t += a.s;
        r.s = t;
    } else if (op == '+') {
        if (a.isNum || b.isNum) { err = true; return; }
        r.s = a.s + b.s;
    } else {
        if (a.isNum || b.isNum) { err = true; return; }
        string t = "";
        for (int i = 0; i < (int)a.s.size(); i++) {
            bool rm = false;
            for (int j = 0; j < (int)b.s.size(); j++)
                if (a.s[i] == b.s[j]) rm = true;
            if (!rm) t += a.s[i];
        }
        r.s = t;
    }
    vst[vtop++] = r;
}

int main() {
    string e;
    if (!getline(cin, e)) return 0;

    int bal = 0;
    for (int i = 0; i < (int)e.size(); i++) {
        if (e[i] == '(') bal++;
        else if (e[i] == ')') { bal--; if (bal < 0) break; }
    }
    if (bal != 0) { cout << "ERROR: Invalid brackets" << "\n"; return 0; }

    vtop = 0; otop = 0; err = false;
    bool expectOperand = true;
    int i = 0, n = e.size();

    while (i < n && !err) {
        char c = e[i];
        if (isalpha((unsigned char)c)) {
            if (!expectOperand) { err = true; break; }
            string s = "";
            while (i < n && isalpha((unsigned char)e[i])) { s += e[i]; i++; }
            Value v; v.isNum = false; v.s = s; v.n = 0;
            vst[vtop++] = v;
            expectOperand = false;
        } else if (isdigit((unsigned char)c)) {
            if (!expectOperand) { err = true; break; }
            long long num = 0;
            while (i < n && isdigit((unsigned char)e[i])) { num = num * 10 + (e[i] - '0'); i++; }
            Value v; v.isNum = true; v.s = ""; v.n = num;
            vst[vtop++] = v;
            expectOperand = false;
        } else if (c == '(') {
            if (!expectOperand) { err = true; break; }
            ost[otop++] = '(';
            i++;
        } else if (c == ')') {
            if (expectOperand) { err = true; break; }
            while (otop > 0 && ost[otop - 1] != '(') { Apply(); if (err) break; }
            if (err) break;
            if (otop == 0) { err = true; break; }
            otop--;
            i++;
            expectOperand = false;
        } else if (c == '+' || c == '-' || c == '*') {
            if (expectOperand) { err = true; break; }
            while (otop > 0 && ost[otop - 1] != '(' && Prec(ost[otop - 1]) >= Prec(c)) { Apply(); if (err) break; }
            if (err) break;
            ost[otop++] = c;
            i++;
            expectOperand = true;
        } else {
            err = true; break;
        }
    }

    if (!err && expectOperand) err = true;
    while (!err && otop > 0) {
        if (ost[otop - 1] == '(') { err = true; break; }
        Apply();
    }

    if (err || vtop != 1 || vst[0].isNum) {
        cout << "ERROR: Invalid expression" << "\n";
        return 0;
    }
    cout << "\"" << vst[0].s << "\"" << "\n";
    return 0;
}
