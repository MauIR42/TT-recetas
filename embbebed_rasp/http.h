#ifndef HTTP_H
#define HTTP_H

char * hostname_to_ip(char * hostname); //not used by the moment, there is no hostname, just ip
char * format_post_request(char * url, struct datos * data, int weight, int id );
char * format_get_request(char * url);
int connect_to_server(char * ip, int puerto );
int send_petition(int sockfd, char * petition);
char * read_response(int sockfd);

//add an send_petition to wrap all these methods?

void send_post(struct datos * time, int weight, int id, char* ingredient, int check);
void send_get();

void delete_users( char *  users);
void add_users( char *  users);
void update_pending( char *  pending);
int check_response( char * response);

#endif