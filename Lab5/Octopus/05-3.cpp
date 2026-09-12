#include <iostream>
#include <string>
using namespace std;

int sum_Name(string n) {
    int x = 0;
    for (char c:n ) {
        if (c >= 'A' && c <= 'Z') x += c - 'A' + 1;
        else if (c >= 'a' && c <= 'z') x += c - 'a' + 1;
    }
    return x;
}


int Hash(int x) {
    int h1 = (123 * x + 524) % 865;
    return (h1 - 1) % 456 + 1;
}

int main() {
    int N;
    string NameHash[460];
    cin >> N;
    cin.ignore();    
    for (int i = 0; i < N; i++) {
        string name;
        getline(cin, name);
        int pos = Hash(sum_Name(name));
        while(!NameHash[pos].empty()) {
            pos++;
            if (pos > 456) pos = 1;
        }
        NameHash[pos] = name;
    }

    for (int i = 1; i <= 456; i++) {
        if (!NameHash[i].empty()) {
            cout << "Player ";
            if ( i < 10 ) cout << "00";
            else if ( i < 100 ) cout << "0";
            cout << i << " - " << NameHash[i] << endl;
        }
    }
}