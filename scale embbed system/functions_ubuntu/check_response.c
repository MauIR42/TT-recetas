#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>

#include "user.h"

int main(int argc, char **argv)
{

	char * response = "{\"error\": false, \"scale#delete\": \"test03,9 \", \"scale#add\": \"test02,6 \", \"scale#ingredients\": \"test01;polvo para hornear,3 psyllium,2 sal,4 semilla de sesamo,8\" }";
	// printf("%s\n", response);
	int n, aux, aux2 = 0, key_found = 0, restart_complete = 0, comillas = 0; //cont is just for testing //found encontro una llave
	char * complete = (char*)malloc(1000 * sizeof(char));
	char * key = (char*)malloc(1000 * sizeof(char));
	aux = 0;
	n = strlen(response);
	while(aux!= n){
		// printf("%c",response[aux]);
		if( response[aux] == ':'){
			key_found = 1;
			complete[aux2] = '\0';
			strcpy(key, complete);
			restart_complete = 1;
			printf("llave: %s\n", key);
		}else if( (!key_found) && (response[aux] != '{' && response[aux] != ' ' && response[aux] != '"') )
			complete[aux2++] = response[aux];
		else if(key_found){

			if( strcmp("error",key) == 0){
				if(response[aux] != ' ' && response[aux] != ',')
					complete[aux2++] = response[aux];
				else if(response[aux] == ','){
					if( strcmp("true", complete) == 0){
						printf("Hubo un error, terminando programa\n");
						return -1;
					}
					printf("Sin error\n");
					key_found = 0;
					restart_complete = 1;

					// break;
				}
			}else if( strcmp("scale#delete",key) == 0){
				// printf("Se ha encontrado el contenido a eliminar\n");
				// printf("texto: %c\n", response[aux]);
				// printf("%c",response[aux]);
				if( comillas == 2){
					complete[aux2] = '\0';
					printf("Datos a eliminar: %s\n", complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if(response[aux] != ' ' && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){
					// printf("comillas\n");
					comillas++;
				}
			}else if( strcmp("scale#add",key) == 0){
				// printf("Se ha encontrado el contenido a agregar\n");
				if( comillas == 2){
					complete[aux2] = '\0';
					printf("Datos a agregar: %s\n", complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if(response[aux] != ' ' && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){
					// printf("comillas\n");
					comillas++;
				}
			}else if( strcmp("scale#ingredients",key) == 0){
				// printf("Se ha encontrado el contenido a modificar en los ingredientes\n");
				if( comillas == 2){
					complete[aux2] = '\0';
					printf("Datos a actualizar: %s\n", complete);
					key_found = 0;
					comillas = 0;
					restart_complete = 1;

				}else if(response[aux] != ' ' && response[aux] != '"')
					complete[aux2++] = response[aux];
				else if(response[aux] == '"'){
					// printf("comillas\n");
					comillas++;
				}
			}
		}

		if(restart_complete){
			restart_complete = 0;
			complete[0] = '\0';
			aux2 = 0;
		}
		aux++;

	}
	return 0;
}