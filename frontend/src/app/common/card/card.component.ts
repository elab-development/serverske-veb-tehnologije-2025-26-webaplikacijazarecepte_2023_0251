import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Recipe {
  id: number;
  name: string;
  creator: string;
  taste: string;
  meat: string;
  occasion: string;
  cookingMethod: string;
  timeToMake: number;
  ingredientWeight: number;
  ingredients: string;
  description: string;
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

export interface Rating {
  username: string;
  rating: number;
  comment?: string;
  dateRated: string;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() recipe!: Recipe;

  get displayRating(): string {
    if (this.recipe.totalRatings === 0) {
      return 'Nema ocena';
    }
    return `${this.recipe.averageRating.toFixed(1)} ⭐ (${this.recipe.totalRatings})`;
  }

  get tasteDisplay(): string {
    const tasteMap: { [key: string]: string } = {
      'slatko': 'Slatko',
      'slano': 'Slano',
      'ljuto': 'Ljuto',
      'kiselo': 'Kiselo'
    };
    return tasteMap[this.recipe.taste] || this.recipe.taste;
  }

  get tasteClasses(): string {
    const classMap: { [key: string]: string } = {
      'slatko': 'bg-sw2 text-sw1',
      'slano': 'bg-sa2 text-sa1', 
      'ljuto': 'bg-sp2 text-sp1',
      'kiselo': 'bg-so2 text-so1'
    };
    return classMap[this.recipe.taste] || 'bg-dark text-light';
  }

  get cardBackgroundClasses(): string {
    const classMap: { [key: string]: string } = {
      'slatko': 'bg-sw1',
      'slano': 'bg-sa1', 
      'ljuto': 'bg-sp1',
      'kiselo': 'bg-so1'
    };
    return classMap[this.recipe.taste] || 'bg-light';
  }

  get cardTextClasses(): string {
    const classMap: { [key: string]: string } = {
      'slatko': 'text-sw2',
      'slano': 'text-sa2', 
      'ljuto': 'text-sp2',
      'kiselo': 'text-so2'
    };
    return classMap[this.recipe.taste] || 'text-dark';
  }
}
