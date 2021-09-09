#include <sys/stat.h>
#include <sys/types.h>
#include <stdlib.h>
#include <stdio.h>
int main(){
	char * path="test";
	struct stat st = {};
	if (stat(path, &st) == -1) {
    	if( 0 != mkdir(path, 0777)){
    		perror("mkdir");
    		exit(1);
    	}
	}
}