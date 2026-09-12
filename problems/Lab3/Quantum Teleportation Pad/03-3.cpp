#include <cstdio>
#include <cstring>

const int MAXPAD = 10005;

typedef struct _pad {
    char id[6];
    struct _pad *warp;
} Pad;

Pad pool[MAXPAD];
int padCnt = 0;

Pad* GetPad(const char *id) {
    for (int i = 0; i < padCnt; i++)
        if (strcmp(pool[i].id, id) == 0) return &pool[i];
    Pad *p = &pool[padCnt++];
    strcpy(p->id, id);
    p->warp = NULL;
    return p;
}

Pad* ReverseGroups(Pad *head, int k) {
    Pad *newHead = NULL, *prevTail = NULL, *cur = head;
    while (cur != NULL) {
        Pad *scan = cur;
        int cnt = 0;
        while (scan != NULL && cnt < k) { scan = scan->warp; cnt++; }
        if (cnt < k) {
            if (prevTail != NULL) prevTail->warp = cur;
            else newHead = cur;
            break;
        }
        Pad *prev = NULL, *node = cur;
        for (int i = 0; i < k; i++) {
            Pad *nxt = node->warp;
            node->warp = prev;
            prev = node;
            node = nxt;
        }
        if (newHead == NULL) newHead = prev;
        if (prevTail != NULL) prevTail->warp = prev;
        prevTail = cur;
        cur = node;
    }
    return newHead;
}

int main() {
    int n, k;
    char s[6], a[6], b[6];
    if (scanf("%d %d %5s", &n, &k, s) != 3) return 0;

    for (int i = 0; i < n; i++) {
        scanf("%5s %5s", a, b);
        Pad *u = GetPad(a);
        Pad *v = GetPad(b);
        u->warp = v;
    }

    Pad *head = GetPad(s);

    Pad *cur = head;
    for (int i = 1; i < padCnt; i++) cur = cur->warp;
    cur->warp = NULL;

    head = ReverseGroups(head, k);

    for (Pad *p = head; p != NULL; p = p->warp) {
        if (p->warp != NULL) printf("%s -> %s\n", p->id, p->warp->id);
        else printf("%s\n", p->id);
    }
    return 0;
}
