@echo off
title Kas Kita Backend - Constrained Memory
echo Starting Kas Kita Backend with low memory profile...

:: Point to JDK 21 to ensure compatibility with Lombok
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.11"
set "PATH=%JAVA_HOME%\bin;%PATH%"

:: Constrain Maven wrapper JVM memory
set MAVEN_OPTS=-Xms32m -Xmx128m -XX:+UseSerialGC

:: Run the Maven Wrapper main class directly using system Java
java -Dmaven.multiModuleProjectDirectory="%CD%\backend" -classpath "%CD%\backend\.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain -f backend/pom.xml spring-boot:run -Dspring-boot.run.jvmArguments="-Xms64m -Xmx256m -XX:+UseSerialGC"
pause