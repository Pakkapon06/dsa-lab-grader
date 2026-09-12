#include <iostream>
#include <string>
#include <queue>
using namespace std;

bool CheckPeriod(const string &s, int d) {
    int n = s.size();
    for (int i = d; i < n; i++)
        if (s[i] != s[i - d]) return false;
    return true;
}

int main() {
    string s;
    cin >> s;
    int n = s.size();

    queue<int> divs;
    for (int d = 1; d <= n; d++)
        if (n % d == 0) divs.push(d);

    int ans = n;
    while (!divs.empty()) {
        int d = divs.front(); divs.pop();
        if (CheckPeriod(s, d)) { ans = d; break; }
    }

    cout << ans << "\n";
    return 0;
}
