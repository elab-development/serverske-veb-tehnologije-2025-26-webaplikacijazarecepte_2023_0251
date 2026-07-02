import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../common/recipe.service';
import { Recipe } from '../../common/card/card.component';
import { FormComponent } from '../../common/form/form.component';
import { AuthService } from '../../common/auth.service';

@Component({
  selector: 'app-recipe',
  standalone: true,
  imports: [CommonModule, FormComponent],
  templateUrl: './recipe.component.html',
  styleUrl: './recipe.component.scss'
})
export class RecipeComponent implements OnInit {
  recipe: Recipe | null = null;
  loading: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private recipeService: RecipeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecipe(parseInt(id));
    }
  }

  loadRecipe(id: number): void {
    this.loading = true;
    this.recipeService.getRecipeById(id).subscribe({
      next: (recipe) => {
        this.recipe = recipe || null;
        this.loading = false;
        if (!this.recipe) {
          this.router.navigate(['/browse']);
        }
      },
      error: (error) => {
        console.error('Error loading recipe:', error);
        this.loading = false;
        this.router.navigate(['/browse']);
      }
    });
  }

  get displayRating(): string {
    if (!this.recipe || this.recipe.totalRatings === 0) {
      return 'Nema ocena';
    }
    return `${this.recipe.averageRating.toFixed(1)} ⭐ (${this.recipe.totalRatings})`;
  }

  get tasteDisplay(): string {
    if (!this.recipe) return '';
    const tasteMap: { [key: string]: string } = {
      'slatko': 'Slatko',
      'slano': 'Slano',
      'ljuto': 'Ljuto',
      'kiselo': 'Kiselo'
    };
    return tasteMap[this.recipe.taste] || this.recipe.taste;
  }

  get tasteClasses(): string {
    if (!this.recipe) return 'bg-dark text-light';
    const classMap: { [key: string]: string } = {
      'slatko': 'bg-sw2 text-sw1',
      'slano': 'bg-sa2 text-sa1', 
      'ljuto': 'bg-sp2 text-sp1',
      'kiselo': 'bg-so2 text-so1'
    };
    return classMap[this.recipe.taste] || 'bg-dark text-light';
  }

  get cardBackgroundClasses(): string {
    if (!this.recipe) return 'bg-light';
    const classMap: { [key: string]: string } = {
      'slatko': 'bg-sw1',
      'slano': 'bg-sa1', 
      'ljuto': 'bg-sp1',
      'kiselo': 'bg-so1'
    };
    return classMap[this.recipe.taste] || 'bg-light';
  }

  get cardTextClasses(): string {
    if (!this.recipe) return 'text-dark';
    const classMap: { [key: string]: string } = {
      'slatko': 'text-sw2',
      'slano': 'text-sa2', 
      'ljuto': 'text-sp2',
      'kiselo': 'text-so2'
    };
    return classMap[this.recipe.taste] || 'text-dark';
  }

  get isLoggedIn(): boolean {
    return this.authService.getCurrentUser() !== null;
  }

  get isLiked(): boolean {
    if (!this.isLoggedIn || !this.recipe) return false;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.liked) return false;
    return currentUser.liked.includes(this.recipe.id);
  }

  toggleLike(): void {
    if (!this.isLoggedIn || !this.recipe) {
      alert('Morate biti ulogovani da biste označili recept kao omiljeni!');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Initialize liked array if it doesn't exist
    if (!currentUser.liked) {
      currentUser.liked = [];
    }

    const recipeId = this.recipe.id;
    const isCurrentlyLiked = currentUser.liked.includes(recipeId);

    if (isCurrentlyLiked) {
      // Remove from liked
      const index = currentUser.liked.indexOf(recipeId);
      if (index > -1) {
        currentUser.liked.splice(index, 1);
      }
    } else {
      // Add to liked
      currentUser.liked.push(recipeId);
    }

    // Update the user in localStorage
    this.authService.updateCurrentUser(currentUser);
    
    // TODO: In a real app, this would update the backend
    console.log('Recipe like status changed:', {
      recipeId,
      isLiked: !isCurrentlyLiked,
      userLikedRecipes: currentUser.liked
    });
  }

  onRatingSubmit(ratingData: any): void {
    if (!this.recipe || !this.isLoggedIn) {
      alert('Morate biti ulogovani da biste ostavili ocenu!');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const existingRating = this.recipe.ratings.find(r => r.username === currentUser.username);
    if (existingRating) {
      alert('Već ste ocenili ovaj recept!');
      return;
    }

    const newRating = {
      username: currentUser.username,
      rating: parseInt(ratingData.rating),
      comment: ratingData.comment || '',
      dateRated: new Date().toISOString()
    };

    this.recipe.ratings.push(newRating);
    
    const totalRating = this.recipe.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.recipe.averageRating = totalRating / this.recipe.ratings.length;
    this.recipe.totalRatings = this.recipe.ratings.length;

    alert('Hvala vam na oceni!');
    
    console.log('Rating submitted:', newRating);
  }
}
