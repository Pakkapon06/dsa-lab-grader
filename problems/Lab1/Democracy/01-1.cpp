#include <iostream>
#include <string>
using namespace std;

typedef struct Word_ {
    string word;
    int count;
} Word;

int main() {
    string input;
    int last_word = 0, find = 0;
    Word data[100];

    while (getline(cin, input)) {
        if (input.empty()) {
            continue;
        }

        find = 0;

        for (int i = 0; i < last_word; i++) {
            if (input == data[i].word) {
                data[i].count += 1;
                find = 1;
                break;
            }
        }

        if (!(find)) {
            data[last_word].word = input;
            data[last_word].count = 1;
            last_word++;
        }
    }

    for (int i = 1; i < last_word; i++) {
        Word key = data[i];
        int j = i - 1;
        while (j >= 0 && data[j].count < key.count) {
            data[j + 1] = data[j];
            j--;
        }
        data[j + 1] = key;
    }

    for (int i = 0; i < last_word; i++) {
        cout << data[i].word << " : " << data[i].count << endl;
    }

    return 0;
}
