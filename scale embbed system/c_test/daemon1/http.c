#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <syslog.h>

#include "defs.h"
#include "http.h"

int connect_to_server(char * ip, int puerto){
	int sockfd;
	struct sockaddr_in direccion_servidor;
	memset (&direccion_servidor, 0, sizeof (direccion_servidor));
	direccion_servidor.sin_family = AF_INET;
	direccion_servidor.sin_port = htons(puerto);
	if( inet_pton(AF_INET, ip, &direccion_servidor.sin_addr) <= 0 )
	{
		syslog(LOG_INFO,"Ocurrio un error al momento de asignar la direccion IP");
		exit(1);
	}

	syslog(LOG_INFO,"Creando Socket ....\n");
	if( (sockfd = socket (AF_INET, SOCK_STREAM, 0)) < 0 )
	{
		syslog(LOG_INFO,"Ocurrio un problema en la creacion del socket");
		exit(1);
	}

	syslog(LOG_INFO,"Estableciendo conexion ...\n");
	if( connect(sockfd, (struct sockaddr *)&direccion_servidor, sizeof(direccion_servidor) ) < 0) 
	{
		syslog(LOG_INFO,"Ocurrio un problema al establecer la conexion");
		exit(1);
	}

	return sockfd;
}

void send_petition(int sockfd, char * petition){
	syslog(LOG_INFO,"Enviando mensaje al servidor ...\n");
	if( write(sockfd, petition, sizeof(char)*strlen(petition)) < 0 )
	{
		syslog(LOG_INFO,"Ocurrio un problema en el envio de un mensaje al cliente");
		exit(1);
	}
}

void read_response(int sockfd){
	char response[51];
	char * complete = (char*)malloc(300 * sizeof(char));
	char column_name[40], next_c = '\r', previous = '\n', aux_char;
	int n, aux, aux2 = 0, next = 0; //cont is just for testing
	int add = 1, c_l = 0, returns = 0, content = 0;
	while ((n = read (sockfd, response, sizeof(char)*50)) > 0)
	{	
		response[n] = '\0';
		aux = 0;
		while(aux!= n){
			if(content){
				// printf("obtener el content:\n");
				complete[aux2] = response[aux];
			}
			else{
				if(response[aux] != ' ' && response[aux] != '\n' && response[aux] != '\r'){
					column_name[aux2] = response[aux];
				}
				else{
					column_name[ aux2 ] = '\0';	
					if(next){
						c_l = atoi(column_name);
						next = 0;
						complete = (char*) realloc(complete, c_l + 1);
					}
					if(!strcmp("Content-Length:", column_name))
						next = 1;
					strcpy(column_name,"");
					if(response[aux] == next_c){
						returns++;
						aux_char = next_c;
						next_c = previous;
						previous = aux_char;
					}
					else
						returns = 0;
					if(returns == 4){
						content = 1;
					}
					aux2 = 0;
					add = 0;
					// break;
				}
			}
			aux++;
			if(add)
				aux2++;
			else{
				add = 1;
			}
		}
		// break;
	}
	// printf("%s\n", complete);
	free(complete);
}


char * struct_to_http_method(char * method, char * url, struct datos * data, int weight, int id){
	static char petition_complete[150];
	char petition[] = "%s %s%s HTTP/1.0%s\r\n\r\n %s";
	char post_addition_bone[] = "\r\nContent-Length: %d\r\nContent-Type: application/json";
	char post_addition[60];

	char post_json_bone[] = "{\"time\" : \"%x:%x:%x_%x-%x-%x\", \"weight\": %d, \"id\": %d}\0";
	char post_json[70];

	char get_params_bone[] = "?time=%x:%x:%x_%x-%x-%x&weight=%d&id=%d";
	char get_params[20];


	if(!strcmp("POST", method)){
		syslog(LOG_INFO,"creando peticion POST\n");
		sprintf(post_json, post_json_bone, data->horas, data->minutos, data->segundos,data->dia,data->mes,data->anio,weight,id);
		// printf("json: %s\n", post_json);
		sprintf(post_addition,post_addition_bone, sizeof(post_json));
		// printf("post_addition: %s\n", post_addition);
		sprintf(petition_complete, petition, method,url,"",post_addition,post_json );
	}
	else{
		syslog(LOG_INFO,"creando peticion GET\n");
		sprintf(get_params,get_params_bone,data->horas, data->minutos, data->segundos,data->dia,data->mes,data->anio,weight,id);
		sprintf(petition_complete, petition, method,url,get_params,"","");
	}
	return petition_complete;
}

char * hostname_to_ip(char * hostname )
{
	struct hostent *he; //estructura hostent representa una entrada de host 
	char * IP;
		
	if ( (he = gethostbyname( hostname ) ) == NULL) 
	{
		syslog(LOG_INFO,"Error al obtener la estructura hostent\n");
		exit(0);
	}
	IP = inet_ntoa(*((struct in_addr*) 	// estructura in_addr estrcutura extraña que al menos contiene sin_addr que es la dirección ip
                           he->h_addr_list[0]));  //h_addr_list lista que en la posición 0 tiene la dirección IP 
                           //inet_ntoa convierte los bytes a una direccion IPV4 en notacion de números y puntos	
	return IP;
}