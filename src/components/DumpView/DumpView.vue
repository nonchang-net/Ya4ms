<template>
	<div class="dump">
		<div class="column">
			<div class="row">
				<div class="header">
					Ar
				</div>
				<div class="value">
					1
				</div>
			</div>
			<div class="row">
				<div class="header">
					Br
				</div>
				<div class="value">
					1
				</div>
			</div>
			<div class="row">
				<div class="header">
					Yr
				</div>
				<div class="value">
					1
				</div>
			</div>
			<div class="row">
				<div class="header">
					Zr
				</div>
				<div class="value">
					1
				</div>
			</div>
		</div>

		<div class="column">
			<div class="row">
				<div class="header">
					A'
				</div>
				<div class="value">
					1
				</div>
			</div>
			<div class="row">
				<div class="header">
					B'
				</div>
				<div class="value">
					1
				</div>
			</div>
			<div class="row">
				<div class="header">
					Y'
				</div>
				<div class="value">
					1
				</div>
			</div>
			<div class="row">
				<div class="header">
					Z'
				</div>
				<div class="value">
					1
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">

.dump{

	.column{
		display : flex;
		flex-direction : row;
		margin : 5px;
		border : 1px solid gray;
		border-radius : 10px ;
		font-weight : bold ;
	}

	.row{
		display : flex;
		flex-direction : column;
		// padding : 5px ;
		// margin : 10px;
		border : 1px solid gray;
		border-radius : 10px ;
		.header{
			background : rgb(15, 94, 41);
			color : white;
		}
		.value{
			background : rgb(198, 255, 217);
		}
	}
}
</style>