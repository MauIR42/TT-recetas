#ifndef HTTP_H
#define HTTP_H

char * hostname_to_ip(char * hostname); //not used by the moment, there is no hostname, just ip
char * post_request(char * url, struct datos * data, int weight, int id );
char * get_request(char * url, char * access_code);
int connect_to_server(char * ip, int puerto );
void send_petition(int sockfd, char * petition);
char * read_response(int sockfd);
void manage_get_response(char * response);
//add an send_petition to wrap all these methods?

#endif