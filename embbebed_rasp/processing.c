#include <stdlib.h>

#include "processing.h"

int binary_to_int(unsigned char data,int len){
	unsigned char test= 0x1;
	int indx = 0;
	int res = 0;
	for(indx = 0; indx < len; indx++){
		if(data & test)
			res <<= 1;
		else
			res <<= 0;
		test <<= 0;
	}
	return res;
}

int to_int(unsigned char * binary){

	return (int)(( (binary[0] << 16)| (binary[1] << 8) | (binary[2])) & 0x7fffff)- 
			(( (binary[0] << 16)| (binary[1] << 8) | (binary[2])) & 0x800000);
}

int * heap_sort(int * data, int len){
	int start = len/2 - 1, indx;
	int temp;
	for(indx = start; indx >= 0; indx --){
		data = heapify(data,len, indx);
	}
	for(indx = len -1; indx >= 0; indx--){
		temp = data[indx];
		data[indx] = data [0];
		data[0] = temp;
		data = heapify(data,indx, 0);
	}
	return &data[0];
}

int * heapify(int * data, int len, int c){
	int largest = c, l = c * 2 + 1, r = c * 2 + 2;
	int temp;
	if( l <= (len - 1) && data[largest] < data[l])
		largest = l;
	if( r <= (len - 1) && data[largest] < data[r] )
		largest = r;
	if(largest != c){
		temp = data[c];
		data[c] = data[largest];
		data[largest] = temp;
		return heapify(data, len, largest);
	}
	return data;
}

int get_averange(int *reads,int len,int to_trim){
	int total = 0, indx;
	for(indx = to_trim; indx < (len - to_trim); indx++)
		total += reads[indx];
	free(reads);
	return total / (len - (to_trim * 2));
}