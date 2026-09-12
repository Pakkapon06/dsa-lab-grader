#include <cstdio>

const int MAXN = 200000;
int nxt[MAXN + 1];
int prv[MAXN + 1];

int main() {
    int n, q;
    scanf("%d %d", &n, &q);

    char cmd[8];
    for (int i = 0; i < q; i++) {
        scanf("%s", cmd);
        if (cmd[0] == 'L') {
            int u, v;
            scanf("%d %d", &u, &v);
            nxt[u] = v;
            prv[v] = u;
        } else if (cmd[0] == 'C') {
            int u, v;
            scanf("%d %d", &u, &v);
            nxt[u] = 0;
            prv[v] = 0;
        } else if (cmd[0] == 'M') {
            int u, v, w;
            scanf("%d %d %d", &u, &v, &w);
            int a = prv[u], b = nxt[v];
            if (a) nxt[a] = b;
            if (b) prv[b] = a;
            prv[u] = 0;
            nxt[v] = 0;
            int c = nxt[w];
            nxt[w] = u;
            prv[u] = w;
            nxt[v] = c;
            if (c) prv[c] = v;
        } else {
            int x;
            scanf("%d", &x);
            while (prv[x]) x = prv[x];
            bool first = true;
            for (int cur = x; cur != 0; cur = nxt[cur]) {
                if (first) printf("%d", cur);
                else printf(" %d", cur);
                first = false;
            }
            printf("\n");
        }
    }

    return 0;
}
