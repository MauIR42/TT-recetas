#ifndef MENU_H
#define MENU_H

struct node* create_menu(int init);
struct node* read_menu(char * file, struct node *file_father);
enum ButtonStates delay_debounce(enum ButtonStates button_state, int button);
void free_menu(struct node * to_erase);
int check_substring(char * text, char * subs);

#endif
