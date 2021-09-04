PROYECTO=LCD
DESTDIR=/usr/local/bin
CFLAGS=-Wall
CC=gcc
OBJECTS=$(patsubst %.c,%.o,$(wildcard *.c))
all: $(PROYECTO)

%.o: %.c
	$(CC) -c $< $(CFLAGS)

$(PROYECTO): $(OBJECTS)
	$(CC) $^ -o $@ 

.PHONY: clean

install: all
	if [ ! -d $(DESTDIR) ] ; then \
			sudo mkdir $(DESTDIR); \
	fi; \
	sudo cp $(PROYECTO) $(DESTDIR)

uninstall:
	sudo rm $(DESTDIR)/$(PROYECTO)

clean: 
	rm -f *.o $(PROYECTO)
