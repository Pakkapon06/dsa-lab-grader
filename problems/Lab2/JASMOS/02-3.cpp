#include <iostream>
#include <string>
#include <cmath>
using namespace std;

typedef struct _coordinate {
    string character;
    int x, y;
} Coord;

bool CheckCoord(int x, int y, double a, double b, double c, double d, int lastX) {
    double h = a * x * x * x + b * x * x + c * x + d;
    // cout << floor(h + 1e-6) << endl;
    double y1 = floor(h + 1e-6);

    if (y == y1) return true;

    if (x < lastX) {
        int nx = x + 1;
        double hNext = a * nx * nx * nx + b * nx * nx + c * nx + d;

        double y2 = floor(hNext + 1e-6);

        if (y > min(y1, y2) && y < max(y1, y2)) return true;
    }
    
    return false;
}


int main() {
    double a,b,c,d;
    int min = -20, max = 20;
    cin >> a;
    cin >> b;
    cin >> c;
    cin >> d;


    for(int i = min, j = 10; i <= max && j >= -10; i++) {
        if (CheckCoord(i, j, a, b, c, d, max)) {
            cout << "*";
        }

        else if (i == 0 && j == 0) {
            cout << "+";
        }

        else if (i == 0) {
            cout << "|";
        }

        else if (j == 0) {
            cout << "-";
        }

        else {
            cout << ".";
        }

        if (i == max) {
            i = min - 1;
            j--;
            cout << endl;
        }
    }

    return 0;
}