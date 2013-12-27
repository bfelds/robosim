define([],
function() {
	var _anonBlockCount = 0;

	//Verifiers
	function _verifyVariableAssignment(type, value) {
		switch (type) {
			case "int": {

			} break;

			case "double": {

			} break;

			case "string": {

			} break;

			case "char": {

			} break;
		}
	}

	function _verifyProgram(program) {
		var scope = {
			variables: {},
			childScopes: {},
			parentScope: null
		};
		//scope.__childScopes = {}; //Store the child scopes 

		//Get the list of statements
		var statements = program.statements;
		for (var i = 0, len = statements.length; i < len; i++) {
			var statement = statements[i];
			if (statement.nodeType === "VariableDeclaration") {
				console.log('Processing VariableDeclaration');
				//Check if this already exists in our scope
				for (var varIdx = 0; varIdx < statement.declarators.length; varIdx++) {
					var variable = statement.declarators[varIdx];
					if (scope.variables[variable.name] !== undefined) {
						console.warn("Identifier '" + variable.name + "' already exists in current scope");
						return {
							isError: true,
							message: "Identifier '" + variable.name + "' already exists in current scope.",
							line: variable.loc.line,
							column: variable.loc.column
						};
					}

					//Populate with values
					var varValue;
					if (variable.initializer !== undefined) {
						//Check type
						if (statement.type === "int") {
							if (variable.initializer.nodeType === "Literal") {
								if (variable.initializer.type === "NumericLiteral") {
									varValue = parseInt(variable.initializer.value.toString(), 10);
								}
								else {
									return {
										isError: true,
										message: "Trying to assign value of type " + variable.initializer.type + " to variable of type " + statement.type,
										line: variable.loc.line,
										column: variable.loc.column
									};
								}
							}
						}

						//TODO implement for the rest
					}

					scope.variables[variable.name] = {
						type: statement.type,
						value: varValue
					};
				}
			}
		}

		return scope;
	}

	function _verifyBlock(node, scope) {

	}

	function ProgramError(message, line, col) {
		this.message = message;
		this.line = line;
		this.col = col;
	}
	
	function RobotProgram(ast) {
		var _ast = ast;

		//This will store the global scope for variables
		var _scope = {};

		//Need to verify the program
		//var scope = _verifyProgram(_ast);
		//console.log('Program Verification Complete');
		//console.log(scope);

		var theScope = {
			'print': {
				type: 'function',
				ref: {
					body: [ {
						execute: function(context) {
							console.log('[PROGRAM OUTPUT]',context['printString']);
						}
					}
					]
				},
				parameters: [{
					type: "string",
					name: "printString",
				}]
			}
		};

		this.execute = function() {
			_ast.execute(theScope);

		};

		this.abort = function () {
			theScope.__abort = true;
		};

		//========================================
		//Experimentation with stepping through the AST structure

		var __currentStatement = _ast;
		var __nextStatement;
		var __returnLocation;
		var __returnVal;

		this.executeNext = function() {
			if (!__currentStatement) {
				console.warn("No more statements to process");
				return;
			}

			// Handle the different cases
			//Special case for Program, just jump right in
			if (__currentStatement.nodeType === "Program") {
				__currentStatement = __currentStatement.statements[0];
				__nextStatement = __currentStatement.statements[1];
			}

			//If it's a function declaration, just execute the entire thing
			if (__currentStatement.nodeType === "FunctionDeclaration" ||
				__currentStatement.nodeType === "VariableDeclaration") {
				__currentStatement.execute(theScope);
				__currentStatement = __nextStatement;
			}
		};
	}

	return RobotProgram;
});