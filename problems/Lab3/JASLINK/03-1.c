#include <stdio.h>

#define MAXV 200000

typedef struct _node {
    int num;
    struct _node *next;
} Node;

Node node[MAXV + 1];
char hasPrev[MAXV + 1];

void insert(int u, int v) {
    node[u].num = u;
    node[v].num = v;
    node[u].next = &node[v];
    hasPrev[v] = 1;
}

void printList(Node *head) {
    for (Node *cur = head; cur != NULL; cur = cur->next)
        printf("%d ", cur->num);
    printf("\n");
}

int main(void) {
    int n;
    if (scanf("%d", &n) != 1) return 0;

    for (int i = 0; i < n - 1; i++) {
        int u, v;
        scanf("%d %d", &u, &v);
        insert(u, v);
    }

    if (n == 1) {
        printf("\n");
        return 0;
    }

    Node *head = NULL;
    for (int x = 1; x <= MAXV; x++)
        if (node[x].num != 0 && !hasPrev[x]) { head = &node[x]; break; }

    printList(head);
    return 0;
}
