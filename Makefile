ln:
	ln -svf $(CURDIR)/node_modules/sinon ./app/lib
	ln -svf $(CURDIR)/api ./node_modules

rundb:
	ulimit -n 1000 && mongod --port 27019 --dbpath ./db --rest --auth --smallfiles &

mongo:
	mongo --port 27019

.PHONY: ln rundb mongo
