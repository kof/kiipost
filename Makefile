ln:
	ln -svf ../shared ./node_modules
	ln -svf ../api ./node_modules
	ln -svf ../app ./node_modules

rundb:
	ulimit -n 1000 && mongod --port 27019 --dbpath ./db --rest --auth --smallfiles &

mongo:
	mongo localhost:27019/kiipost

.PHONY: ln rundb mongo
