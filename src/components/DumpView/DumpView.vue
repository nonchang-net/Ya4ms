<template>
	<div class="dump">
		<div class="column">
			<div class="row">
				<div class="header">
					Ar
				</div>
				<div class="value">
					{{ a }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Br
				</div>
				<div class="value">
					{{ b }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Yr
				</div>
				<div class="value">
					{{ y }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Zr
				</div>
				<div class="value">
					{{ z }}
				</div>
			</div>
		</div>

		<div class="column">
			<div class="row">
				<div class="header">
					A'
				</div>
				<div class="value">
					{{ a2 }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					B'
				</div>
				<div class="value">
					{{ b2 }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Y'
				</div>
				<div class="value">
					{{ y2 }}
				</div>
			</div>
			<div class="row">
				<div class="header">
					Z'
				</div>
				<div class="value">
					{{ z2 }}
				</div>
			</div>
		</div>
	</div>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DumpFormat } from '../../pureTypeScriptSrc/gmc4/State';

@Component
export default class DumpView extends Vue {

	private dumps?: DumpFormat | null = null;

	public get a(): string {
		return this.dumps == null ? '-' : this.dumps.registers.a.toString(16);
	}

	public get b(): string {
		return this.dumps == null ? '-' : this.dumps.registers.b.toString(16);
	}

	public get y(): string {
		return this.dumps == null ? '-' : this.dumps.registers.y.toString(16);
	}

	public get z(): string {
		return this.dumps == null ? '-' : this.dumps.registers.z.toString(16);
	}

	public get a2(): string {
		return this.dumps == null ? '-' : this.dumps.registers2.a.toString(16);
	}

	public get b2(): string {
		return this.dumps == null ? '-' : this.dumps.registers2.b.toString(16);
	}

	public get y2(): string {
		return this.dumps == null ? '-' : this.dumps.registers2.y.toString(16);
	}

	public get z2(): string {
		return this.dumps == null ? '-' : this.dumps.registers2.z.toString(16);
	}

	public Set(dumps: DumpFormat): void {
		this.dumps = dumps;
	}
}

</script>

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