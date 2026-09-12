#include <iostream>
#include <string>
using namespace std;


int main() {
    string rec[65540];
    int n;
    if (!(cin >> n)) return 0;
    cin.ignore();
    for (int i = 0; i < n; i++) getline(cin, rec[i]);
    string key;
    getline(cin, key);

    int kl = 0;
    bool lfound = false;
    for (int i = 0; i < n; i++) {
        kl++;
        if (rec[i] == key) { lfound = true; break; }
    }

    int kb = 0;
    bool bfound = false;
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        kb++;
        if (rec[mid] == key) { bfound = true; break; }
        else if (rec[mid] < key) lo = mid + 1;
        else hi = mid - 1;
    }

    cout << "Linear Search: " << kl << (kl == 1 ? " comparison" : " comparisons") << "\n";
    cout << "Binary Search: " << kb << (kb == 1 ? " comparison" : " comparisons") << "\n";
    if (!lfound) cout << "It's a trap!" << "\n";
    else if (kl < kb) cout << "Spread!" << "\n";
    else if (kb < kl && bfound) cout << "Split!" << "\n";
    else if (kl == kb) cout << "Any!" << "\n";
    else cout << "Spread!" << "\n";
    return 0;
}