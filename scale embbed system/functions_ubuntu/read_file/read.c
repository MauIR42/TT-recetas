#define _XOPEN_SOURCE 500
#include <ftw.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>

#include <sys/stat.h>
#include <sys/types.h>

int main(){
	char aux;
	FILE *fo;
	fo = fopen("prueba.txt", "r");
	if( fo == NULL){
		printf("Error al abrir el archivo: %s\n", "prueba.txt");
		return -1;
	}
	while( (aux = fgetc(fo)) != EOF){
		// fputc(aux,fc);
		printf("%c", aux);
		//aux = fgetc(fo);
	}

	fclose(fo);
	// fclose(fc);
	return 0;
}