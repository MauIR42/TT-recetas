#ifndef HTTP_H
#define HTTP_H

char * hostname_to_ip(char * hostname); //not used by the moment, there is no hostname, just ip
char * struct_to_http_method(char * method, char * url, struct datos * data, int weight, int id );
int connect_to_server(char * ip, int puerto );
void send_petition(int sockfd, char * petition);
void read_response(int sockfd);
//add an send_petition to wrap all these methods?

#endif