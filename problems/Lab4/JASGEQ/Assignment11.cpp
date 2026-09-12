#include <iostream>

using namespace std;

const int MAXX = 100;

int A[MAXX], B[MAXX], C[MAXX];
int topA = -1;
int topB = -1;
int topC = -1;

void printTower() {
    cout << "tower A:";
    for (int i = topA; i >= 0; i--) {
        cout << " " << A[i];
    }
    cout << endl;

    cout << "tower B:";
    for (int i = topB; i >= 0; i--) {
        cout << " " << B[i];
    }
    cout << endl;

    cout << "tower C:";
    for (int i = topC; i >= 0; i--) {
        cout << " " << C[i];
    }
    cout << endl << endl;
}

void moveDisk(char from, char to) {
    int disk;

    if (from == 'A') {
        disk = A[topA--];
    } else if (from == 'B') {
        disk = B[topB--];
    } else {
        disk = C[topC--];
    }

    if (to == 'A') {
        A[++topA] = disk;
    } else if (to == 'B') {
        B[++topB] = disk;
    } else {
        C[++topC] = disk;
    }

    cout << "move " << from << " to " << to << endl;
    printTower();
}

void move(int n, char from, char aux, char to) {
    if (n == 1) {
        moveDisk(from, to);
        return;
    }

    move(n - 1, from, to, aux);
    moveDisk(from, to);
    move(n - 1, aux, from, to);
}

int main() {
    int N;

    cout << "Input N = ";
    cin >> N;

    for (int i = N - 1; i >= 0; i--) {
        A[++topA] = i;
    }

    cout << "\nStart" << endl;
    printTower();

    move(N, 'A', 'B', 'C');

    return 0;
}