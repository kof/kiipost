rundb:
	ulimit -n 1000 && mongod --port 27019 --dbpath ./db --rest --auth --smallfiles &

mongo:
	mongo localhost:27019/kiipost

.PHONY: rundb mongo
