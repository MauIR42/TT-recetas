#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include<netdb.h>

struct datos {
	unsigned char segundos;
	unsigned char minutos; 
	unsigned char horas;
	unsigned char dia;
	unsigned char mes;
	unsigned char anio;
	int weight;
	int user_id;
};

// char * hostname_to_ip(char * hostname);

int main(int argc, char **argv)
{
	int puerto;
	char * hostName;
	if(argc < 2){
		printf("Falta el puerto ejemplo: ./cli 17065\n");
		exit(0);
	}
	else{
		// hostName = argv[1];
		puerto = atoi(argv[1]);
	}


	int tamano_direccion, sockfd;
	struct sockaddr_in direccion_servidor;
	struct hostent *he;
	char * ip;
	struct datos prueba;
	// ip = hostname_to_ip(hostName);
	ip = "192.168.100.41";
	memset (&direccion_servidor, 0, sizeof (direccion_servidor));
	direccion_servidor.sin_family = AF_INET;
	direccion_servidor.sin_port = htons(puerto);
	char json[] = "{\"test\":\"123\"}";
	char petition[] = "POST /scale/user_weight/ HTTP/1.0\r\nContent-Length: %d\r\nContent-Type: application/json\r\n\r\n %s";
	char petition_complete[150];
	sprintf(petition_complete, petition, sizeof(json), json);
	// char petition[] = "GET /scale/user_weight/?test=hola HTTP/1.0\r\n\r\n";
	printf("%s\n", petition_complete);
	if( inet_pton(AF_INET, ip, &direccion_servidor.sin_addr) <= 0 )
	{
		perror("Ocurrio un error al momento de asignar la direccion IP");
		exit(1);
	}

	printf("Creando Socket ....\n");
	if( (sockfd = socket (AF_INET, SOCK_STREAM, 0)) < 0 )
	{
		perror("Ocurrio un problema en la creacion del socket");
		exit(1);
	}

	printf ("Estableciendo conexion ...\n");
	if( connect(sockfd, (struct sockaddr *)&direccion_servidor, sizeof(direccion_servidor) ) < 0) 
	{
		perror ("Ocurrio un problema al establecer la conexion");
		// exit(1);
	}


	printf ("Enviando mensaje al servidor ...\n");
	if( write(sockfd, petition_complete, sizeof(petition_complete)) < 0 )
	{
		perror("Ocurrio un problema en el envio de un mensaje al cliente");
		exit(1);
	}
	// printf ("Recibiendo contestacion del servidor ...\n");
	// if (read (sockfd, &prueba, sizeof(struct datos)) < 0)
	// {	
	// 	perror ("Ocurrio algun problema al recibir datos del cliente");
	// 	exit(1);
	// }

	// printf("La hora es : %x:%x:%x\n", prueba.horas,prueba.minutos,prueba.segundos );
	// printf("La fecha es : %x/%x/%x\n", prueba.dia,prueba.mes,prueba.anio);
	// printf("La temperatura es : %d\n", (int)prueba.temperatura);
/*
 *	Cierre de la conexion
 */
	close(sockfd);

	return 0;
}
	
// char * hostname_to_ip(char * hostname )
// {
// 	struct hostent *he; //estructura hostent representa una entrada de host 
// 	char * IP;
		
// 	if ( (he = gethostbyname( hostname ) ) == NULL) 
// 	{
// 		printf("Error al obtener la estructura hostent\n");
// 		exit(0);
// 	}
// 	IP = inet_ntoa(*((struct in_addr*) 	// estructura in_addr estrcutura extraña que al menos contiene sin_addr que es la dirección ip
//                            he->h_addr_list[0]));  //h_addr_list lista que en la posición 0 tiene la dirección IP 
//                            //inet_ntoa convierte los bytes a una direccion IPV4 en notacion de números y puntos	
// 	return IP;
// }