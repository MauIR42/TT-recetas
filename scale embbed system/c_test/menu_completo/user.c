#define _XOPEN_SOURCE 500
#include <ftw.h>
#include <stdio.h>
#include <unistd.h>
#include <string.h>

#include "user.h"

char * get_first(char * file){
	FILE * fd;
	char text[16], *to_return;
	fd = fopen(file, "r");
	fgets(text,16,fd);
	printf("%s\n", text);
	to_return = strdup(text);
	fclose(fd);
	return to_return;
}

void set_last( char * new_last){
	FILE *fd = fopen("last.txt", "w");
	fputs(new_last,fd);
	fclose(fd);
}

void delete_user(char * user_path){
	int result = nftw(user_path, delete_file, 12, FTW_DEPTH | FTW_PHYS);
	printf("El resultado de eliminar fue %d\n", result );
	copy_except("users.txt",user_path);

}


int delete_file(const char *f_path, const struct stat *sb, int typeflag, struct FTW *ftwbuf){
	int rf = remove(f_path); //file_path
	if(rf){
		perror("Error al intentar borrar el archivo");
		perror(f_path);
	}
	return rf;
}

void copy_except(char * file,char * except){
	printf("A eliminar: %s\n", except);
	FILE * fd, * fd_aux;
	int keep = 1, cont_indx = 0;
	char aux;
	char container[20];
	fd = fopen(file,"r");
	while( keep ){
		aux = fgetc(fd);
		printf("%c\n", aux);
		if(aux == '\n' || aux == '\0'){
			container[cont_indx] = '\0';
			printf("%s\n", container);
			if(strcmp(except,container)){
				container[ cont_indx ] = '\n';
				container[ cont_indx + 1 ] = '\0';
				printf("Escribiendo %s\n", container);
				fd_aux = fopen("aux.txt", "a");
				fputs(container,fd_aux);
				fclose(fd_aux);
			}
			cont_indx = 0;
		}
		else
			container[cont_indx++] = aux;
		if(feof(fd))
			keep = 0;

	}
	printf("Sale!\n");
	fclose(fd);
	remove(file);
	printf("Elimina!\n");
	rename("aux.txt","users.txt");
	printf("Renombra!\n");
}