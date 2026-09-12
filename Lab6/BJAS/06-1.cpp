#include <cstdio>
#include <set>
using namespace std;

int a[200005], b[200005];

int main() {
    int n, k;
    scanf("%d %d", &n, &k);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = 0; i < k; i++) scanf("%d", &b[i]);

    multiset<int> bots(b, b + k);
    int T = 0;
    for (int i = 0; i < n; i++) {
        auto it = bots.lower_bound(a[i]);
        if (it == bots.end()) break;
        bots.erase(it);
        T = i + 1;
    }

    multiset<int> walls(a, a + T);
    int m = 0;
    for (int i = 0; i < k && !walls.empty(); i++) {
        auto it = walls.upper_bound(b[i]);
        if (it != walls.begin()) walls.erase(prev(it));
        m = i + 1;
    }

    printf("%d %d\n", T, m);
    return 0;
}