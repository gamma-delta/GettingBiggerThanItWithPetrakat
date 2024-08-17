build : clean assets
	tsc --project tsconfig.json

assets :
	cp src/index.html out
	cp -r src/include out
	cp -r assets out
	svgo -i ./inkscape/world.svg -o ./out/assets/world.svg

serve : build
    python3 -m http.server --directory out

clean :
    mkdir -p out
    rm --recursive --force out/*
