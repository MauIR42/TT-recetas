PROYECTO=check_response
DESTDIR=/usr/local/bin
CFLAGS=-Wall
LFLAGS=-pthread
CC=gcc
OBJECTS=$(patsubst %.c,%.o,$(wildcard *.c))
all: $(PROYECTO)

%.o: %.c
	$(CC) -c $< $(CFLAGS)

$(PROYECTO): $(OBJECTS)
	$(CC) $^ -o $@ $(LFLAGS)

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
