ln:
	ln -svf ../../node_modules/sinon ./app/lib
	ln -svf ../shared ./node_modules
	ln -svf ../api ./node_modules

rundb:
	ulimit -n 1000 && mongod --port 27019 --dbpath ./db --rest --auth --smallfiles &

mongo:
	mongo localhost:27019/kiipost

port-redirect:
	# find and run the appropriate command for Linux / Mac
	if [ -x /sbin/ipfw ]; then sudo /sbin/ipfw add 1 fwd 0.0.0.0,1337 tcp from any to me 80; fi
	if command -v iptables >/dev/null 2>&1; then sudo iptables -t nat -A OUTPUT -o lo -p tcp --dport 80 -j REDIRECT --to-port 1337; fi

.PHONY: ln rundb mongo port-redirect
