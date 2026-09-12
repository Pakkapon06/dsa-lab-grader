#include <cstdio>

const int MAXX = 203113;
int meaw[MAXX];
int cat[MAXX];
long long Mstack[MAXX];

int main() {
    int n;
    scanf("%d", &n);

    long long total = 0;
    for (int i = 1; i <= n; i++) {
        scanf("%d", &meaw[i]);
        total += meaw[i];
    }
    
    bool clash = false;

    int top = 0;
    long long sum = 0;
    for (int i = 1; i <= n && !clash; i++) {
        long long current = sum;
        while (top > 0 && cat[top] < meaw[i]) {
            if (Mstack[top] < current) current = Mstack[top];
            top--;
        }
        if (current < sum) clash = true;
        cat[++top] = meaw[i];
        Mstack[top] = current;
        sum += meaw[i];
    }

    top = 0;
    sum = total;
    for (int i = n; i >= 1 && !clash; i--) {
        long long current = sum;
        while (top > 0 && cat[top] <= meaw[i]) {
            if (Mstack[top] > current) current = Mstack[top];
            top--;
        }
        if (current > sum) clash = true;
        cat[++top] = meaw[i];
        Mstack[top] = current;
        sum -= meaw[i];
    }

    printf(clash ? "NO" : "YES");
}