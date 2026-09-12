#include <iostream>
using namespace std;

int hp[100005], po[100005], fr[100005];
bool pois[100005], inq[100005];

int main() {
    int N, x0, cnt = 0;
    cin >> N >> x0;

    for (int i = 0; i < N; i++) {
        cin >> hp[i];
        if (hp[i] == 0) { pois[i] = true; po[i] = x0; cnt++; }
    }
    if (cnt == N) { cout << 0; return 0; }

    int fn = 0;
    for (int i = 0; i < N; i++)
        if (!pois[i] && ((i > 0 && pois[i - 1]) || (i + 1 < N && pois[i + 1]))) {
            inq[i] = true;
            fr[fn++] = i;
        }

    long long days = 0;
    while (cnt < N) {
        int m = fn;
        long long best = -1;
        for (int k = 0; k < m; k++) {
            int i = fr[k];
            long long rate = 0;
            if (i > 0 && pois[i - 1]) rate += po[i - 1] / 2;
            if (i + 1 < N && pois[i + 1]) rate += po[i + 1] / 2;
            if (rate == 0) continue;
            long long d = (hp[i] - po[i] + rate - 1) / rate;
            if (best < 0 || d < best) best = d;
        }
        if (best < 0) break;
        days += best;

        for (int k = 0; k < m; k++) {
            int i = fr[k];
            long long rate = 0;
            if (i > 0 && pois[i - 1]) rate += po[i - 1] / 2;
            if (i + 1 < N && pois[i + 1]) rate += po[i + 1] / 2;
            long long v = po[i] + rate * best;
            po[i] = v > 2000000 ? 2000000 : (int)v;
        }
        for (int k = 0; k < m; k++) {
            int i = fr[k];
            if (po[i] >= hp[i]) { pois[i] = true; cnt++; }
        }
        for (int k = 0; k < m; k++) {
            int i = fr[k];
            if (!pois[i]) continue;
            if (i > 0 && !pois[i - 1] && !inq[i - 1]) { inq[i - 1] = true; fr[fn++] = i - 1; }
            if (i + 1 < N && !pois[i + 1] && !inq[i + 1]) { inq[i + 1] = true; fr[fn++] = i + 1; }
        }
        int w = 0;
        for (int k = 0; k < fn; k++)
            if (!pois[fr[k]]) fr[w++] = fr[k];
        fn = w;
    }

    if (cnt == N) cout << days + 1;
    else cout << -1;

    return 0;
}