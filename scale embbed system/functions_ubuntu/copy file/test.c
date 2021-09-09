#define _XOPEN_SOURCE 500
#include <ftw.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>

#include <sys/stat.h>
#include <sys/types.h>

int copy_file(char* original, char * copy);

int main(){
	struct stat st = {0};
	if (stat("test", &st) == -1) {
    	mkdir("test", 0777);
	}
	copy_file("lista.txt","test/lista.txt");
	return 0;
}


int copy_file(char* original, char * copy){
	printf("Original: %s\n", original);
	printf("copia: %s\n", copy);
	char aux;
	FILE *fo, *fc;
	fo = fopen(original, "r");
	if( fo == NULL){
		printf("Error al abrir el archivo: %s\n", original);
		return -1;
	}

	fc = fopen(copy, "w");
	if( fc == NULL){
		printf("Error al abrir el archivo: %s\n", copy);
		return -1;
	}

	aux = fgetc(fo);
	while(aux != EOF){
		fputc(aux,fc);
		aux = fgetc(fo);
	}

	fclose(fo);
	fclose(fc);
	return 0;
}