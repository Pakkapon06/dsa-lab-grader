#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;

    int count[26] = {0};
    long long ans = 0;
    int l = 0;

    for (int r = 0; r < (int)s.size(); ++r) {
        int c = s[r] - 'a';
        ++count[c];
        while (count[c] > 1) {
            --count[s[l] - 'a'];
            ++l;
        }
        ans += (long long)(r - l + 1);
    }

    cout << ans << '\n';
    return 0;
}