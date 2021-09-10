#ifndef USER_H
#define USER_H

char * get_first(char * file);
void set_last( char * new_last);
char * get_until_delimiter(char * file, char delimiter);

void delete_user(char * user);
void copy_except(char * file,char * except);
int delete_file(const char *f_path, const struct stat *sb, int typeflag, struct FTW *ftwbuf);

void add_user(char * user_path);
void add_at_end(char * file,char * user_path);
void create_path( char * path);
int copy_file(char * original,char * copy);

int get_user_id(char * current_user);

void update_user_pending(char * user, char * pending);
#endif